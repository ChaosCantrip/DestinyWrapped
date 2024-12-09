export default async function ReportPage({ params }){
    const { bungie_id } = await params;
    const response = await fetch(`${process.env.API_URL}/fetch_data/${bungie_id}`);
    const response_json = await response.json();
    const status = response_json.status;
    
    if (status == "completed") {
        return (
            <div>
                <h1>Report</h1>
                <pre>{JSON.stringify(response_json.data, null, 2)}</pre>
            </div>
        )
    } else if (status == "update_required") {
        return (
            <div>
                <h1>Report</h1>
                <p>Update Required</p>
            </div>
        )
    } else if (status == "pending" || status == "processing") {
        return (
            <div>
                <h1>Report</h1>
                <p>Processing...</p>
            </div>
        )
    } else if (status == "new") {
        return (
            <div>
                <h1>Report</h1>
                <p>Creating report...</p>
            </div>
        )
    } else {
        return (
            <div>
                <h1>Report</h1>
                <p>Error</p>
            </div>
        )
    }
}