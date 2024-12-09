@echo off

for %%A in (GOOGLE_CLOUD_FUNCTION GOOGLE_CLOUD_DB GOOGLE_CLOUD_DOCUMENT GOOGLE_CLOUD_PROJECT GOOGLE_CLOUD_REGION GOOGLE_CLOUD_TRIGGER_LOCATION BUNGIE_API_KEY) do (
    if not defined %%A (
        echo %%A Environment Variable not set
        exit /b 1
    )
)

@echo on

gcloud functions deploy %GOOGLE_CLOUD_FUNCTION% ^
--gen2 ^
--runtime=python312 ^
--region=%GOOGLE_CLOUD_REGION% ^
--trigger-location=%GOOGLE_CLOUD_TRIGGER_LOCATION% ^
--source=. ^
--entry-point=entry_point ^
--trigger-event-filters=type=google.cloud.firestore.document.v1.written ^
--trigger-event-filters=database=%GOOGLE_CLOUD_DB% ^
--trigger-event-filters-path-pattern=document=%GOOGLE_CLOUD_DOCUMENT% ^
--set-env-vars GOOGLE_CLOUD_PROJECT=%GOOGLE_CLOUD_PROJECT%,BUNGIE_API_KEY=%BUNGIE_API_KEY%