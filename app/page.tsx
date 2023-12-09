'use client'

import Select from '@/components/Select';
import React from 'react'
import io from 'socket.io-client'
let socket

const delay = (delayInms = 500) => { return new Promise(resolve => setTimeout(resolve, delayInms)) };

export default function Home() {
  const [messages, setMessages] = React.useState<any>([])
  const [idsDestacados, setIdsDestacados] = React.useState<string[]>([])
  const [labels, setLabels] = React.useState<any>({})
  const [ports, setPorts] = React.useState<any>([])
  const [portSelected, setPortSelected] = React.useState<any>({
    friendlyName: "Selecione uma porta",
    serialNumber: false
  })

  const handleDestaque = (id: string) => {
    if (idsDestacados.includes(id)) {
      setIdsDestacados((prevState: string[]) => {
        return prevState.filter(i => i !== id)
      })
    } else {
      setIdsDestacados((prevState: string[]) => {
        return [...prevState, id]
      })
    }
  }

  const handleClickByte = ({ id, index, byte }: any) => {
    const mappedBytes = JSON.parse(sessionStorage.getItem('mappedBytes') || '')
    const label = window.prompt("Insira um label");

    const actual = mappedBytes[id] || {}
    const newData = { ...actual }
    const labelsMapped = newData[index] || {}
    labelsMapped[byte] = label
    newData[index] = labelsMapped

    mappedBytes[id] = newData

    sessionStorage.setItem('mappedBytes', JSON.stringify(mappedBytes))
    setLabels(mappedBytes)
  }

  const fetchPortsList = async () => {
    const data = await fetch('/api/serialPortsList')
    const ports = await data.json()
    setPorts(ports)
  }

  const handleConnect = async (firstTime = true) => {
    await fetch(`/api/connect?port=${portSelected.path}`)
    socket = io()

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on('data-update', msg => {
      if (msg === messages) return;
      setMessages(msg)
    })
    if (firstTime) handleConnect(false)
  }

  const getLabel = ({ id, index, byte }: any) => {
    const mappedBytes = labels
    if (!mappedBytes[id] || !mappedBytes[id][index] || !mappedBytes[id][index][byte]) return null

    return mappedBytes[id][index][byte]
  }

  React.useEffect(() => {
    fetchPortsList()
    const initLabels = sessionStorage.getItem('mappedBytes') || '{}'
    setLabels(JSON.parse(initLabels))
    return () => { }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative overflow-hidden w-10/12 min-h-full pb-40">
        <div className=" grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3 p-3 pl-0 min-h-full">
          <div className="sm:col-span-1 sm:col-start-1 ">
            <Select options={ports} handleSelect={setPortSelected} selected={portSelected} />
          </div>
          <div className="sm:col-span-2">
            <button
              disabled={!portSelected.path}
              onClick={() => handleConnect()}
              type="submit"
              className={`rounded-md ${portSelected.path ? "opacity-100" : "opacity-30"} bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
              Connect
            </button>
          </div>
        </div>
        <table className="rounded-lg text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 w-full" style={{ overflow: 'hidden' }}>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 0
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 1
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 2
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 3
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 4
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 5
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 6
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                BYTE 7
              </th>
            </tr>
          </thead>
          <tbody>
            {/* {datas.map((data, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  teste
                </th>
              </tr>
            ))} */}
            {messages.map((message: any, index: number) => {
              return (
                <tr
                  key={message.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  style={{
                    opacity: idsDestacados.length && !idsDestacados.includes(message.id) ? 0.2 : 1
                  }}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white w-fit"
                    onClick={() => handleDestaque(message.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {message.id}
                  </th>
                  {message.bytes.map((byte: string, index: number) => (
                    <TD
                      key={index}
                      data={byte}
                      label={getLabel({ id: message.id, index, byte })}
                      onHandleClick={() => handleClickByte({ id: message.id, index, byte })}
                    />
                  ))}
                  <TRDataFake totalBytes={message.dlc} />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </main>
  )
}

function TD({ data, label, onHandleClick }: any) {
  const [byte, setByte] = React.useState(data)
  const [updated, setUpdated] = React.useState(true)

  React.useEffect(() => {
    setByte(data)
    data != byte ? setUpdated(true) : setUpdated(false)

    setTimeout(() => setUpdated(false), 500)

    return () => { setUpdated(false) }
  }, [data])

  return (
    <td
      className={`px-6 py-4 text-center hover:scale-150 transition ease-in-out w-fit ${updated && "data-updated"}`}
      onClick={() => onHandleClick()}
    >
      {byte}
      <span style={{ display: 'block', fontSize: '10px' }}>{label}</span>
    </td>
  )
}

function TRDataFake({ totalBytes }: any) {
  const totalDataToAdd = 8 - totalBytes
  const data = []
  for (let index = 0; index < totalDataToAdd; index++) {
    data.push('-')
  }
  return data.map((element, index) => (
    <td key={index} className="px-6 py-4 text-center w-fit">
      {element}
    </td>
  ))
}