'use client'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useGetCallById } from '@/hooks/useGetCallById'
import { useUser } from '@clerk/nextjs'
import { useStreamVideoClient } from '@stream-io/video-react-sdk'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Table = ({title, desc}: {title: string, desc: string}) => (
  <div className='flex flex-col items-start gap-2 xl:flex-row'>
    <h1 className='text-base font-medium text-sky-1 lg:text-xl xl:min-w-32'>{title}:</h1>
    <h1 className='truncate text-sm font-medium max-sm:max-w-[320px] lg:text-lg'>{desc}</h1>
  </div>
)

const PersonalRoom = () => {
  const { user } = useUser();
  const client = useStreamVideoClient();
  const router = useRouter();

  const meetingID = user?.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingID}?personal=true`;

  const { call } = useGetCallById(meetingLink!);
  const { toast } = useToast();

  const startRoom = async () => {
    if(!user || !client) return;

    if(!call){
      const newCall = client.call('default', meetingID!);

      await newCall.getOrCreate({
        data: {
            starts_at: new Date(Date.now()).toISOString(),
        }
      })
    }

    router.push(`/meeting/${meetingID}?personal=true`)
  } 

  return (
    <section className='flex size-full flex-col gap-10 text-white'>
      <h1 className='text-3xl font-bold'>Personal Room</h1>

      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title='Topic' desc={ `${user?.username}'s Meeting Room`} />
        <Table title='Meeting ID' desc={meetingID!} />
        <Table title='Invite Link' desc={meetingLink} />
      </div>

      <div className="flex gap-5">
        <Button className='bg-blue-1' onClick={startRoom}>
          Start Meeting
        </Button>

        <Button className='bg-dark-3' onClick={() => {
          navigator.clipboard.writeText(meetingLink);
          toast({title: 'Link copied'})
        }}>
            <Image src='/icons/copy.svg' alt='copy' width={20} height={20}/>
            &nbsp; Copy Link
        </Button>
      </div>
    </section>
  )
}

export default PersonalRoom