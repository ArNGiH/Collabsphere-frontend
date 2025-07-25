type TitleProps={
    text:string
}
const Title=({text}:TitleProps)=>{
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>
    )
}
export default Title