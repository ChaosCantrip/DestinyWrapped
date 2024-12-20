from cloudevents.http import CloudEvent
import functions_framework
from google.cloud import firestore
from google.events.cloud import firestore as firestoredata
import requests
from datetime import datetime
import json
import os
import logging

DATA_VERSION = 1
START_DATE = datetime.fromisoformat("2023-12-01T00:00:00Z")
END_DATE = datetime.fromisoformat("2024-12-01T00:00:00Z")

client = firestore.Client()

@functions_framework.cloud_event
def entry_point(cloud_event: CloudEvent) -> None:
    firestore_payload = firestoredata.DocumentEventData()
    firestore_payload._pb.ParseFromString(cloud_event.data)

    path_parts = firestore_payload.value.name.split("/")
    separator_idx = path_parts.index("documents")
    collection_path = path_parts[separator_idx + 1]
    document_path = "/".join(path_parts[(separator_idx + 2) :])

    job_doc = client.collection(collection_path).document(document_path)

    bungie_id = firestore_payload.value.fields["bungie_id"].string_value
    status = firestore_payload.value.fields["status"].string_value

    if status != "pending":
        return
    
    logging.info(f"Beginning processing for {bungie_id}")

    job_doc.update({
        "status": "processing"
    })

    try:
        data = process_data(bungie_id)

        data_document = client.collection("processed_data").document(bungie_id)
        data_document.set({
            "bungie_id": bungie_id,
            "data_version": DATA_VERSION,
            "data": json.dumps(data)
        })

        job_doc.update({
            "status": "completed"
        })

        logging.info(f"Finished processing for {bungie_id}")

    except Exception as e:
        job_doc.update({
            "status": "failed"
        })
        logging.exception(f"Error during processing for {bungie_id}\n\n{e}", exc_info=True)
        raise e


def send_get_request(url):
    return requests.get(
        f"https://www.bungie.net/Platform/{url}",
        headers={
            "X-API-Key": os.environ["BUNGIE_API_KEY"]
        }
    )


def process_data(bungie_id: str) -> dict:

    profile_response = send_get_request(f"Destiny2/3/Profile/{bungie_id}?components=200")
    profile_response_json = profile_response.json()

    character_ids: list[str] = profile_response_json["Response"]["characters"]["data"].keys()
    activities: list[dict] = []

    for character_id in character_ids:
        start_date_reached = False
        page = -1
        while not start_date_reached:
            page += 1
            history_response = send_get_request(f"Destiny2/3/Account/{bungie_id}/Character/{character_id}/Stats/Activities?count=200&mode=None&page={page}")
            history_response_json = history_response.json()

            for activity in history_response_json["Response"]["activities"]:
                date = datetime.fromisoformat(activity["period"])
                if date > END_DATE:
                    continue
                if date < START_DATE:
                    start_date_reached = True
                    break
                activities.append(activity)

    raids = {}
    dungeons = {}
    for activity in activities:
        if activity["activityDetails"]["mode"] == 4:
            activity_hash = activity["activityDetails"]["referenceId"]
            if activity_hash not in raids:
                raids[activity_hash] = {
                    "successfulCompletions": 0,
                    "failedCompletions": 0,
                    "time": 0
                }
            if activity["values"]["completed"]["basic"]["value"] == 1.0:
                raids[activity_hash]["successfulCompletions"] += 1
            else:
                raids[activity_hash]["failedCompletions"] += 1
            raids[activity_hash]["time"] += activity["values"]["activityDurationSeconds"]["basic"]["value"]

    return {
        "raids": raids
    }
