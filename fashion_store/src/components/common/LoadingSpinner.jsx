const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizes[size]} rounded-full border-2 border-[#E4E0D8] border-t-[#C9A84C] animate-spin`} />
            {text && <p className="text-[0.7rem] tracking-[0.12em] uppercase text-[#8A8680]">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
