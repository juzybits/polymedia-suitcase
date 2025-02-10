import { ReactNode } from "react";

export const Card = ({ className, children }: {
    className?: string;
    children: ReactNode;
}) => {
    return <div className={`card compact ${className ?? ""}`}>
        {children}
    </div>;
};

export const CardSpinner = ({ className = "compact" }: {
    className?: string;
}) => {
    return <div className={`card ${className}`}>
        <FullCardMsg>
            <div className="card-spinner" />
        </FullCardMsg>
    </div>;
};

export const CardMsg = ({ className = "compact", children }: {
    className?: string;
    children: ReactNode;
}) => {
    return <div className={`card break-any ${className}`}>
        <FullCardMsg>
            {children}
        </FullCardMsg>
    </div>;
};

const FullCardMsg = ({ children }: {
    children: ReactNode;
}) => {
    return <div className="full-card-message">
        <div className="msg">
            {children}
        </div>
    </div>;
};
