"client component"

import { useConnection } from "@/context/connect";
import { connect } from "http2";
import Image from "next/image"
import { useEffect, useState } from "react"



interface IMsgDatTypes {
    user: String;
    msg: String;
    time: String;
}

export default function ChatPage({ userName }: any){

    const [currentMsg, setCurrentMsg] = useState("");
    const [chatMessages, setChatMessages] = useState<IMsgDatTypes[]>([]);
    const { connection } = useConnection();
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    async function sendMessage(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(currentMsg !== ""){
            const newMsg: IMsgDatTypes = {
                user: userName,
                msg: currentMsg,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            }

            connection.emit("send-message", newMsg);
            setCurrentMsg("");
        }
    }

    useEffect(()=>{
        if(connection){
            //connection.emit("join_room", userName)
            console.log(userName)
            connection.on("receive-msg", (msg: IMsgDatTypes) => {
                setChatMessages((msgs) => [...msgs, msg]);
                
            })

            connection.on("update-online-users", (users: any) => {
                setOnlineUsers(users);
                console.log (users)
            });
    
            return () => {
                // Desconectar o connection quando o componente for desmontado
                connection.disconnect();
            };
        }
    }, [connection]);


    return(
        <div className="flex ">
            {/* Barra Lateral */}
            <div className="flex flex-col w-96 h-screen bg-blue-300 p-3 gap-6 border-green-600">
                <div className="w-2/3">
                    <Image
                        src="/images/logo-chat-dcc.png"
                        alt='Logo chat'
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="w-full h-full"
                        priority
                    />
                </div>
                <div className="flex flex-col gap-2 text-white" > 
                    <span>Usuários online</span>
                    <ul>
                        {onlineUsers.map((user) => (
                            <li key={user}>{user}</li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Chat principal */}
            <div className="flex flex-col w-full h-screen px-10 py-5 bg-gray-300 justify-between">
                <div>
                    {chatMessages.map(({ user, msg, time }, key) => (
                        <div
                            key={key}
                            className={`mb-2 p-5 ${
                                user === userName ? "self-end bg-gray-700" : "bg-gray-700"
                            } text-white rounded-md`}
                        >   
                            <div>{user}:</div>
                            <div>{msg}</div>
                            <div>{time}</div>
                        </div>
                    ))}
                </div>
                <div>
                    <form onSubmit={sendMessage} className="flex gap-2 w-full justify-center">
                            <input type="text" className="rounded px-2 py-3 text-grey-700 border border-gray-400 w-2/3" placeholder="Digite sua mensagem" 
                            value={currentMsg} 
                            onChange={(e)=>setCurrentMsg(e.target.value)} 
                            required
                        />
                        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}