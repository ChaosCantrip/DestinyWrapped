export default async function SearchPage({ searchParams }) {
    let { search, page } = await searchParams;
    if (!search) {
        return (
            <div>
                <h1>Search</h1>
                <p>No search query provided.</p>
            </div>
        )
    }
    if (!page) {
        page = "0";
    }
    const response = await fetch(`${process.env.API_URL}/search/`, {
        method: "POST",
        body: JSON.stringify({
            search_query: search,
            page: page
        })
    });
    const response_json = await response.json();
    return (
        <div>
            <h1>Search</h1>
            <div>
                { response_json.results.map((result) => {
                    return (
                        <div>
                            <img src={result.icon_path} />
                            <p>{result.display_name}#{result.display_code}</p>
                            <a href={`/report/${result.membership_id}`}>Report</a>
                        </div>
                    )
                })}
            </div>
            <div>
                { page > 0 ?
                    <a href={`/search?search=${search}&page=${parseInt(page) - 1}`}>Previous</a> : <p>Previous</p>
                }
                { response_json.has_more ?
                    <a href={`/search?search=${search}&page=${parseInt(page) + 1}`}>Next</a> : <p>Next</p>
                }
            </div>
        </div>
    )
}