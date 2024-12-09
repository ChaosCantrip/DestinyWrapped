import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { search_query, page } = body;

    if (!search_query) {
        return {
            status: 400,
            body: {
                status: "error",
                message: "Missing search_query"
            }
        }
    }

    const response = await fetch(`https://www.bungie.net/Platform/User/Search/GlobalName/${page}`, {
        method: "POST",
        headers: {
            "X-API-Key": process.env.BUNGIE_API_KEY
        },
        body: JSON.stringify({
            displayNamePrefix: search_query
        })
    });

    if (!response.ok) {
        return NextResponse.json({
            status: "error",
            message: "Failed to fetch data"
        }, {
            status: response.status
        })
    }

    const results = [];
    const response_json = await response.json();
    for (const user of response_json.Response.searchResults) {
        const destiny_memberships = user.destinyMemberships;
        const destiny_membership = destiny_memberships[0];
        if (destiny_memberships.length > 1) {
            for (const membership of destiny_memberships) {
                if (membership.membershipType === membership.crossSaveOverride) {
                    const destiny_membership = membership;
                    break;
                }
            }
        }
        results.push({
            icon_path: `https://www.bungie.net${destiny_membership.iconPath}`,
            membership_id: destiny_membership.membershipId,
            membership_type: destiny_membership.membershipType,
            display_name: user.bungieGlobalDisplayName,
            display_code: user.bungieGlobalDisplayNameCode
        });
    }

    return NextResponse.json({
        results: results,
        has_more: response_json.Response.hasMore
    });
}