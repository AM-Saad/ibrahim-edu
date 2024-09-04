async function fetchdata(url, method, body, contentType) {
    let res
    try {
        if (contentType) {
            if (method === 'post' || method === 'put') {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: body
                })
            } else {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
            }

        } else {
            if (method === 'post' || method === 'put') {
                res = await fetch(url, {
                    method: method,
                    body: body
                })
            } else {
                res = await fetch(url, {
                    method: method,

                })
            }

        }
        const json = await res.json()
        if (res.status == 200 || res.status == 201) {
            return { res, json }
        } else {
            message(json.message, json.messageType, 'body')
            return null
        }
    } catch (error) {
        message('Something went wrong, please try again later', 'warning', 'body')
    }
}