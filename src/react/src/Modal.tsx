import "./Modal.css";

/**
 * A modal window.
 */
export const Modal: React.FC<{
    styleBackground?: React.CSSProperties;
    styleContent?: React.CSSProperties;
    children: React.ReactNode;
}> = ({
    styleBackground = {},
    styleContent = {},
    children,
}) =>
{
    if (!children) {
        return null;
    }

    return (
        <div className="modal-background" style={styleBackground}>
            <div className="modal-content" style={styleContent}>
                {children}
            </div>
        </div>
    );
};
