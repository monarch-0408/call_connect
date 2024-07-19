'use client'

import { DeviceSettings, VideoPreview, useCall } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './button';

const MeetingSetup = ({setIsSetupComplete}: { setIsSetupComplete: (value: boolean) => void}) => {
    const [isMicCam, setIsMicCam] = useState(true);
    const call = useCall();

    if(!call) throw new Error('Call must exist within Stream Call') 

    useEffect(() => {
        if(!isMicCam){
            call?.camera.disable();
            call?.microphone.disable();
        }
        else{
            call?.camera.enable();
            call?.microphone.enable();
        }
    }, [isMicCam, call?.camera, call?.microphone])

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-3 text-white'>
        <h1 className='text-2xl font-bol'>Setup</h1>

        <VideoPreview className='flex h-[500px]'/>

        <div className='flex h-16 items-center justify-center gap-3'>
            <label className='flex items-center justify-center gap-2 font-medium'>
                <input type='checkbox' checked={!isMicCam} onChange={(e) => setIsMicCam(!e.target.checked)} />
                Join with mic and camera off
            </label>
            <DeviceSettings />
        </div>

        <Button 
            className='rounded-md bg-green-500 px-4 py-2.5'
            onClick={() => {
                call.join();
                setIsSetupComplete(true)
            }}>
                Join Meeting
        </Button>
    </div>
  )
}

export default MeetingSetup