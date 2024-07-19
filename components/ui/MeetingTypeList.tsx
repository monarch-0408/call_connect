'use client'

import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import ReactDatePicker from 'react-datepicker'
import { Input } from './input'

const MeetingTypeList = () => {

    const router = useRouter();
    const [meetingState, setMeetingState] = useState<'isScheduledMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();

    const {user} = useUser();
    const client = useStreamVideoClient();

    const [values, setValues] = useState({
        dateTime: new Date(),
        desc: '',
        link: '',
    })

    const [callDetails, setcallDetails] = useState<Call>();
    const { toast } = useToast();

    const createMeeting = async() => {
        if(!user || !client) return;

        try{
            const id = crypto.randomUUID();
            const call = client.call('default', id);

            if(!call) throw new Error('Failed to create call!')

            const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
            
            let desc;
            meetingState === "isScheduledMeeting" 
            ? desc = values.desc || "Scheduled Meeting" 
            : desc = "Instant Meeting"

            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        desc
                    }
                }
            })
            setcallDetails(call);

            if(values.desc === "Instant Meeting"){
                router.push(`/meeting/${call.id}`)
            }
            else {
                const checkMeetingStart = setInterval(() => {
                    const now = new Date();
                    if (now >= values.dateTime) {
                        clearInterval(checkMeetingStart);
                        router.push(`/meeting/${call.id}`);
                    }
                }, 1000); 
            }      

            toast({ title: "Meeting created" })
        }

        catch(error){
            console.log(error);
            toast({ title: "Failed to create meeting" });
        }
    };

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}}`

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
        <HomeCard 
            img='/icons/add-meeting.svg'
            title='New Meeting'
            desc = 'Start an instant meeting'
            handleClick={() => setMeetingState('isInstantMeeting')}
            className = 'bg-orange-1'
        />
        <HomeCard 
            img='/icons/schedule.svg'
            title='Schedule Meeting'
            desc = 'Schedule your meeting'
            handleClick={() => setMeetingState('isScheduledMeeting')}
            className = 'bg-blue-1'
        />
        <HomeCard 
            img='/icons/recordings.svg'
            title='View Recordings'
            desc = 'Check your recordings'
            handleClick={() => router.push('/recordings')}
            className = 'bg-purple-1'
        />
        <HomeCard 
            img='/icons/join-meeting.svg'
            title='Join Meeting'
            desc = 'via invitation link'
            handleClick={() => setMeetingState('isJoiningMeeting')}
            className = 'bg-yellow-1'
        />

        {!callDetails ? (
            <MeetingModal 
                isOpen = {meetingState === 'isScheduledMeeting'}
                onClose={() => setMeetingState(undefined)}
                title='Create meeting'
                className='text-center'
                handleClick={createMeeting}
                buttonText='Start Meeting'
            >
                <div className="flex flex-col gap-2.5">
                    <label className='text-base text-normal leading-[22px] text-sky-2'>Add a description</label>
                    <Textarea 
                        className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                        onChange={(e) => {setValues({...values, desc: e.target.value})}}
                    />
                </div>

                <div className="flex w-full flex-col gap-2.5">
                    <label className='text-base text-normal leading-[22px] text-sky-2'>Select date and time</label>
                    <ReactDatePicker 
                        selected={values.dateTime}
                        onChange={(date) => {setValues({...values, dateTime: date!})}}
                        showTimeSelect
                        timeFormat='HH:mm'
                        timeIntervals={15}
                        timeCaption='time'
                        dateFormat='MMMM d, yyyy h:mm aa'
                        className='w-full rounded bg-dark-3 p-2 focus:outline-none'
                    />
                </div>
            </MeetingModal>) : 
            (
                <MeetingModal 
                    isOpen = {meetingState === 'isScheduledMeeting'}
                    onClose={() => setMeetingState(undefined)}
                    title='Meeting Created'
                    className='text-center'
                    handleClick={() => {
                        navigator.clipboard.writeText(meetingLink);
                        toast({ title: "Link copied" })
                    }}
                    buttonText='Copy meeting link'
                    image='/icons/checked.svg'
                    buttonIcon='/icons/copy.svg'
                />
            )}

        <MeetingModal 
            isOpen = {meetingState === 'isInstantMeeting'}
            onClose={() => setMeetingState(undefined)}
            title='Start an instant meeting'
            className='text-center'
            handleClick={createMeeting}
            buttonText='Start Meeting'
        />

        <MeetingModal 
            isOpen = {meetingState === 'isJoiningMeeting'}
            onClose={() => setMeetingState(undefined)}
            title='Enter meeting link'
            className='text-center'
            handleClick={() => router.push(values.link)}
            buttonText='Join Meeting'
        >
            <Input placeholder='Meeting link' className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0'
                onChange={(e) => setValues({...values, link: e.target.value})}
            />
        </MeetingModal>
    </section>
  )
}

export default MeetingTypeList