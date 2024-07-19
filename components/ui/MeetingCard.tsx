import { avatarImages } from '@/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from './button';
import { useToast } from './use-toast';

interface MeetingCardProps {
    title: string;
    date: string;
    icon: string;
    isPreviousMeeting?: boolean;
    buttonIcon?: string;
    buttonText?: string;
    handleClick: () => void;
    link: string;
}

const MeetingCard = ({ title, date, icon, isPreviousMeeting, buttonIcon, buttonText, handleClick, link }: MeetingCardProps) => {
    const { toast } = useToast();
    
    return (
    <section className='flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]'>
        <article className='flex flex-col gap-5'>
            <Image src={icon} alt='upcoming icon' width={28} height={28}/>
            
            <div className='flex justiy-between'>
                <div className="flex flex-col text-white">
                    <h1 className='text-2xl font-bold'>{title}</h1>
                    <p className='text-base font-normal'>{date}</p>
                </div>
            </div>
        </article>

        <article className='flex justify-center relative'>
            <div className='flex relative w-full max-sm:hidden'>
                {avatarImages.map((image, index) => (
                    <Image key={index} src={image} alt='participant' width={40} height={40} 
                        className={cn("rounded-full", { absolute: index > 0 })} style={{ top: 0, left: index * 28 }}/>
                ))}
                
                <div className="flex-center absolute left-[136px] size-10 rounded-full border-[5px] bg-dark-4 border-dark-3 text-white">
                    +5
                </div>
            </div>

            {!isPreviousMeeting && (
                <div className="flex gap-2">
                    <Button className='rounded bg-blue-1 px-6 text-white' onClick={handleClick}>
                        {buttonIcon && (
                            <Image src={buttonIcon} alt='icon' width={20} height={20}/>
                        )} &nbsp;
                        {buttonText}
                    </Button>

                    <Button className='rounded bg-dark-4 px-6 text-white' onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast({title: 'Link copied'});
                    }}>
                        <Image src='/icons/copy.svg' alt='copy link' width={20} height={20} />
                        &nbsp; Copy link
                    </Button>
                </div>
            )}
        </article>
    </section>
  )
}

export default MeetingCard