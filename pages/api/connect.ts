const { SerialPort, ReadlineParser } = require('serialport')
// const port = new SerialPort({ path: 'COM9', baudRate: 115200 })
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

const { Server } = require("socket.io");

const delay = (delayInms = 500) => { return new Promise(resolve => setTimeout(resolve, delayInms)) };

const messages: any = {}

const handleNewMessage = async (msg: any) => {
  if (!msg.id || !msg.data || !msg.dlc) return;

  const index = randomIntFromInterval()
  msg = DATA[index]

  if (!messages[msg.id]) {
    msg.bytes = msg.data.split(' ')
    msg.fieldsUpdated = []
    for (let index = 0; index < msg.dlc; index++) {
      msg.fieldsUpdated.push(index);
    }
    messages[msg.id] = msg;
    return;
  }

  // Object.entries(messages).forEach(([key, value]: any) => {
  //   value.fieldsUpdated = []
  //   messages[key] = value
  // })

  if (messages[msg.id].data == msg.data) {
    // messages[msg.id].fieldsUpdated = []
    return;
  };

  const oldMesage = { ...messages[msg.id] }
  msg.fieldsUpdated = []
  msg.bytes = msg.data.split(' ')
  msg.bytes.forEach((byte: any, index: number) => {
    if (oldMesage.bytes[index] != byte) msg.fieldsUpdated.push(index)
  })
  messages[msg.id] = msg;
}

let port: any = null
let parser: any = null

export default function handler(req: any, res: any) {

  if (!req.query.port) return res.status(500).json({ error: "PORT NOT SPECIFIED" })

  const PORT = req.query.port

  port = port ? port : new SerialPort({ path: PORT, baudRate: 115200 })
  parser = parser ? parser : port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

  port.on('open', function () {
    console.log('OPEN')
  })

  if (res.socket?.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', async (socket: any) => {
      parser.on('data', function (data: any) {
        const dataRaw = data.toString('utf8')
        const payload = dataRaw.split('/')
        const msg = {
          id: payload[0],
          dlc: Number(payload[1]),
          data: payload[2],
        }
        handleNewMessage(msg)
        socket.broadcast.emit('data-update', Object.entries(messages).map(([key, value]) => value))
      })
    })
  }

  res.end()
  // res.status(200).json({ "id": 3, "username": "john", "name": "John", "location": "France" })
}

function randomIntFromInterval() {
  const max = DATA.length - 1
  return Math.floor(Math.random() * (max - 0 + 1) + 0)
}

const DATA = [
  {
    "id": "3C3",
    "dlc": 3,
    "data": "20 18 30"
  },
  {
    "id": "3C3",
    "dlc": 3,
    "data": "20 18 30"
  },
  {
    "id": "3C5",
    "dlc": 1,
    "data": "0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "545",
    "dlc": 6,
    "data": "41 0 0 0 8 0"
  },
  {
    "id": "3D1",
    "dlc": 3,
    "data": "0 0 20"
  },
  {
    "id": "565",
    "dlc": 7,
    "data": "0 0 0 0 0 0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "700",
    "dlc": 6,
    "data": "0 1E 0 2 3 2F"
  },
  {
    "id": "705",
    "dlc": 2,
    "data": "0 2"
  },
  {
    "id": "708",
    "dlc": 2,
    "data": "0 6"
  },
  {
    "id": "709",
    "dlc": 2,
    "data": "0 6"
  },
  {
    "id": "711",
    "dlc": 2,
    "data": "0 6"
  },
  {
    "id": "703",
    "dlc": 2,
    "data": "0 3E"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 68 0 10 8 0"
  },
  {
    "id": "380",
    "dlc": 8,
    "data": "28 4 48 48 0 18 D 5"
  },
  {
    "id": "3C0",
    "dlc": 4,
    "data": "0 0 0 0"
  },
  {
    "id": "140",
    "dlc": 8,
    "data": "0 0 0 80 0 0 0 80"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "3C5",
    "dlc": 1,
    "data": "0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "389",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "380",
    "dlc": 8,
    "data": "28 4 48 48 0 18 D 5"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "3C0",
    "dlc": 4,
    "data": "0 0 0 0"
  },
  {
    "id": "683",
    "dlc": 6,
    "data": "19 23 7 12 20 23"
  },
  {
    "id": "140",
    "dlc": 8,
    "data": "0 0 0 80 0 0 0 0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "6A3",
    "dlc": 8,
    "data": "16 43 C F4 C F4 14 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 68 0 10 8 0"
  },
  {
    "id": "6C3",
    "dlc": 8,
    "data": "0 0 78 20 66 14 16 43"
  },
  {
    "id": "389",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "6D3",
    "dlc": 8,
    "data": "26 2C C0 0 0 0 0 78"
  },
  {
    "id": "3C5",
    "dlc": 1,
    "data": "0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "6E3",
    "dlc": 5,
    "data": "28 FC 10 92 87"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "388",
    "dlc": 6,
    "data": "8B 0 0 B8 C3 C"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 68 0 10 8 0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "380",
    "dlc": 8,
    "data": "28 4 48 48 0 18 D 0"
  },
  {
    "id": "3C5",
    "dlc": 1,
    "data": "0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "389",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "388",
    "dlc": 6,
    "data": "8B 0 0 B8 C3 C"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 68 0 10 8 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "380",
    "dlc": 8,
    "data": "28 4 48 48 0 18 D 5"
  },
  {
    "id": "3C0",
    "dlc": 4,
    "data": "0 0 0 0"
  },
  {
    "id": "140",
    "dlc": 8,
    "data": "0 0 0 80 0 0 0 80"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "3C3",
    "dlc": 3,
    "data": "20 18 40"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "3C5",
    "dlc": 1,
    "data": "0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "3D1",
    "dlc": 3,
    "data": "0 0 20"
  },
  {
    "id": "683",
    "dlc": 6,
    "data": "19 23 7 12 20 23"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "2A0",
    "dlc": 4,
    "data": "0 0 0 C6"
  },
  {
    "id": "6A3",
    "dlc": 8,
    "data": "16 43 C F4 C F4 14 0"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 78 0 10 8 0"
  },
  {
    "id": "180",
    "dlc": 6,
    "data": "0 78 0 10 8 0"
  },
  {
    "id": "282",
    "dlc": 2,
    "data": "0 0"
  },
  {
    "id": "281",
    "dlc": 8,
    "data": "0 80 80 4A 0 0 1 0"
  },
  {
    "id": "380",
    "dlc": 8,
    "data": "28 4 48 48 0 18 D 0"
  },
  {
    "id": "140",
    "dlc": 8,
    "data": "0 0 0 80 0 0 0 0"
  },
]