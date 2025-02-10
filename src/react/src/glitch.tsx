export const Glitch = ({
    text,
}: {
    text: string;
}) =>
{
    return <div className="glitch">
        <span aria-hidden="true">{text}</span>
        {text}
        <span aria-hidden="true">{text}</span>
    </div>;
};
