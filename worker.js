const api = {
  icon: '⚡️☁️',
  name: 'zebra.rfid.connects.to',
  description: 'Zebra IOT Connector to Cloud API',
  url: 'zebra.rfid.connects.to/api',
  type: 'https://apis.do/iot',
  endpoints: {
    getTenant: 'https://zebra.rfid.connects.to/:tenant',
    allReaders: 'https://zebra.rfid.connects.to/:tenant/readers',
    allReads: 'https://zebra.rfid.connects.to/:tenant/reads',
    enrollReader: 'https://zebra.rfid.connects.to/:tenant/new',
    getReader: 'https://zebra.rfid.connects.to/:tenant/:readerId',
    getReadsForReader: 'https://zebra.rfid.connects.to/:tenant/:readerId',
  },
  site: 'https://zebra.rfid.connects.to',
  login: 'https://zebra.rfid.connects.to/login',
  signup: 'https://zebra.rfid.connects.to/signup',
  repo: 'https://github.com/epcis/zebra-iot-connect',
}

export default {
  fetch: async (req, env) => {
    const { user, body, url, ts, time, headers, cf } = await env.CTX.fetch(req).then(res => res.json())
    const { origin, hostname, pathname } = new URL(req.url)
    let [ _, namespace, id = headers['cf-ray'] ] = pathname.split('/')
    if (namespace.length != 36 || namespace == ':namespace') {
      namespace = crypto.randomUUID() 
    }
    const ua = headers['user-agent']
    const { ip, isp, city, region, country, continent } = user
    const location = `${city}, ${region}, ${country}, ${continent}`
    const list = `https://zebra.rfid.connects.to/${namespace}`
    const data = body ? await env.DB.put(`${namespace}/${id}`, JSON.stringify({ namespace, id, time, url, body, headers, cf, user }, null, 2) , { 
      metadata: { time, ip, ua, location, url: `https://zebra.rfid.connects.to/${namespace}/${id}` },
    }) : id != headers['cf-ray'] ? await env.DB.getWithMetadata(`${namespace}/${id}`, { type: "json" }) : await env.DB.list({ prefix: `${namespace}/`}).then(list => list.keys.map(item => item.metadata))
    return new Response(JSON.stringify({ api, namespace, ts, time, id, list, data, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}
