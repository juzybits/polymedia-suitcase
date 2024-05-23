import "./Modal.css";

export const Modal: React.FC<{
    content: React.ReactNode;
    styleBackground?: React.CSSProperties;
    styleContent?: React.CSSProperties;
}> = ({
    content,
    styleBackground = {},
    styleContent = {},
}) =>
{
    if (!content) {
        return null;
    }

    return (
        <div className="modal-background" style={styleBackground}>
            <div className="modal-content" style={styleContent}>
                {content}
            </div>
        </div>
    );
};
