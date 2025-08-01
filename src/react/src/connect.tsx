import { useCurrentAccount } from "@mysten/dapp-kit";
import { ReactNode } from "react";

import { BtnSubmit } from "./buttons";

export type BtnConnectProps = {
    btnMsg?: string | undefined;
    isWorking: boolean;
    openConnectModal: () => void;
};

export type ConnectToGetStartedProps = {
    connectMsg?: string | undefined;
} & BtnConnectProps;

export type ConnectOrProps = {
    children: ReactNode;
} & ConnectToGetStartedProps;

export const BtnConnect = ({
    btnMsg, isWorking, openConnectModal,
}: BtnConnectProps) =>
{
    return (
        <BtnSubmit disabled={isWorking} onClick={() => Promise.resolve(openConnectModal())}>
            {btnMsg ?? "CONNECT"}
        </BtnSubmit>
    );
};

export const ConnectToGetStarted = ({
    btnMsg, connectMsg, isWorking, openConnectModal,
}: ConnectToGetStartedProps) =>
{
    return <>
        {connectMsg &&
            <div className="card-desc">
                {connectMsg}
            </div>
        }
        <BtnConnect
            btnMsg={btnMsg}
            isWorking={isWorking}
            openConnectModal={openConnectModal}
        />
    </>;
};

export const ConnectOr = ({
    btnMsg, connectMsg, isWorking, openConnectModal, children,
}: ConnectOrProps) =>
{
    const currAcct = useCurrentAccount();
    if (currAcct) {
        return children;
    }
    return <ConnectToGetStarted
        connectMsg={connectMsg}
        btnMsg={btnMsg}
        isWorking={isWorking}
        openConnectModal={openConnectModal}
    />;
};
