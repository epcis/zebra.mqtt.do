export default {
  fetch: async (req, env) => {
    const { user, origin, hostname, pathname, body, url, ts, time, location, headers, cf } = await env.CTX.fetch(req).then(res => res.json())
    
    const api = {
      icon: '⚡️☁️',
      name: 'zebra.mqtt.do',
      description: 'Zebra IOT Connector to Cloud API',
      url: origin + '/api',
      type: 'https://apis.do/iot',
      endpoints: {
        getTenant: origin + '/:tenant',
        allReaders: origin + '/:tenant/readers',
        allReads: origin + '/:tenant/reads',
        enrollReader: origin + '/:tenant/new',
        getReader: origin + '/:tenant/:readerId',
        getReadsForReader: origin + '/:tenant/:readerId',
      },
      site: 'https://mqtt.do',
      login: origin + '/login',
      signup: origin + '/signup',
      repo: 'https://github.com/epcis/zebra-iot-connect',
    }
    
    let [ _, namespace, id = headers['cf-ray'] ] = pathname.split('/')
    if (namespace.length != 36 || namespace == ':namespace') {
      namespace = crypto.randomUUID() 
    }
    const list = `https://zebra.rfid.connects.to/${namespace}`
    const data = body ? await env.DB.put(`${namespace}/${id}`, JSON.stringify({ namespace, id, time, url, body, headers, cf, user }, null, 2) , { 
      metadata: { time, ip, ua, location, url: `https://zebra.rfid.connects.to/${namespace}/${id}` },
    }) : id != headers['cf-ray'] ? await env.DB.getWithMetadata(`${namespace}/${id}`, { type: "json" }) : await env.DB.list({ prefix: `${namespace}/`}).then(list => list.keys.map(item => item.metadata))
    return new Response(JSON.stringify({ api, namespace, ts, time, id, list, data, user }, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' }})
  }
}
