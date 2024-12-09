import { fetch_document, set_document } from "@/lib/firestore";
import { NextResponse } from "next/server";

const DATA_VERSION = 1;

export async function GET(request, { params }) {
    const {bungie_id} = await params;

    if (!bungie_id) {
        return NextResponse.json({
            status: "error",
            message: "Missing bungie_id"
        }, { status: 400 });
    } else if (isNaN(bungie_id) || bungie_id.length !== 19) {
        return NextResponse.json({
            status: "error",
            message: "Invalid bungie_id"
        }, { status: 400 });
    }

    const job_record = await fetch_document("job_queue", bungie_id);

    if (!job_record) {
        await set_document("job_queue", bungie_id, {
            bungie_id: bungie_id,
            status: "pending",
        });

        return NextResponse.json({
            status: "new"
        })
    }

    const job_status = job_record.status;

    if (job_status === "completed") {
        const data_record = await fetch_document("processed_data", bungie_id);
        const data_version = data_record.data_version;

        if (data_version !== DATA_VERSION) {
            await set_document("job_queue", bungie_id, {
                bungie_id: bungie_id,
                status: "pending",
            });

            return NextResponse.json({
                status: "update_required"
            });
        }

        return NextResponse.json({
            status: "completed",
            data: JSON.parse(data_record.data)
        });
    }

    return NextResponse.json({
        status: job_status
    });
}