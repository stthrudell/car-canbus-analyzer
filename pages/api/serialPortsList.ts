const { SerialPort, ReadlineParser } = require('serialport')

export default async function handler(req: any, res: any) {
  const ports = await SerialPort.list()
  res.status(200).json(ports)
}