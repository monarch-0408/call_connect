'use client'

import { useGetCalls } from '@/hooks/useGetCalls'
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import MeetingCard from './MeetingCard';
import Loader from './Loader';

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings'}) => {
    const { endedCalls, upcomingCalls, recordedCalls, isLoading } = useGetCalls();
    const router = useRouter();

    const [recordings, setRecordings] = useState<CallRecording[]>([]);

    const getCalls = () => {
        switch (type) {
            case 'ended':
                return endedCalls;
            case 'upcoming':
                return upcomingCalls;
            case 'recordings':
                return recordings;
            default:
                return [];
        }
    }

    const getNoCalls = () => {
        switch (type) {
            case 'ended':
                return 'No previous calls';
            case 'upcoming':
                return 'No upcoming calls';
            case 'recordings':
                return 'No recorded calls';
            default:
                return '';
        }
    }

    useEffect(() => {
        const fetchRecordings = async () => {
            try{
                const callData = await Promise.all(recordedCalls.map((meeting) => meeting.queryRecordings()));

                const recordings = callData
                    .filter(call => call.recordings.length > 0)
                    .flatMap(call => call.recordings);

                setRecordings(recordings);
            }
            catch (error) {
                console.error('Error fetching recordings:', error);
                setRecordings([]); 
            }
        }
        
        if(type === 'recordings') fetchRecordings();
    }, [type, recordedCalls])

    if(isLoading) return <Loader />
    
    const calls = getCalls();
    const noCallsMessage = getNoCalls();

  return (
    <div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
        {calls && calls.length>0
        ? 
            calls.map((meeting: Call | CallRecording) => (
                <MeetingCard 
                    key={(meeting as Call).id}
                    icon={
                        type === 'ended'
                        ? '/icons/previous.svg'
                        : type ==='upcoming'
                        ? '/icons/upcoming.svg'
                        : 'icons/recordings.svg'
                    }
                    title={(meeting as Call).state?.custom?.desc || (meeting as CallRecording).filename || 'Personal Room'}
                    date={(meeting as Call).state?.startsAt?.toLocaleString() || (meeting as CallRecording).start_time?.toLocaleString()}
                    isPreviousMeeting={type === 'ended'}
                    buttonIcon={
                        type === 'recordings'
                        ? '/icons/play.svg'
                        : undefined
                    }
                    buttonText={
                        type === 'recordings'
                        ? 'Play'
                        : 'Start'
                    }
                    handleClick={
                        type === 'recordings'
                        ? () => router.push(`${(meeting as CallRecording).url}`)
                        : () => router.push(`/meeting/${(meeting as Call).id}`)
                    }
                    link={
                        type === 'recordings'
                        ? (meeting as CallRecording).url
                        : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
                    }
                />
            )) 
        :
            <h1 className='text-white text-2xl font-bold'>{noCallsMessage}</h1>
        }
    </div>
  )
}

export default CallList
