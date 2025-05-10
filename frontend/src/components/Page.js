export default function Page({ children }) {
    return (
        <div className='flex flex-col w-full p-20 bg-gray'>
            <div className='flex flex-col w-full'>{children}</div>
        </div>
    );
}