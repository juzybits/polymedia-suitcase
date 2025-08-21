import { useCurrentAccount } from "@mysten/dapp-kit";
import type { ReactNode } from "react";
import { Btn } from "./buttons";

export type BtnConnectProps = {
	btnMsg?: string | undefined;
	openConnectModal: () => void;
};

export type ConnectToGetStartedProps = {
	connectMsg?: string | undefined;
} & BtnConnectProps;

export type ConnectOrProps = {
	children: ReactNode;
} & ConnectToGetStartedProps;

export const BtnConnect = ({ btnMsg, openConnectModal }: BtnConnectProps) => {
	return (
		<Btn onClick={() => Promise.resolve(openConnectModal())}>{btnMsg ?? "CONNECT"}</Btn>
	);
};

export const ConnectToGetStarted = ({
	btnMsg,
	connectMsg,
	openConnectModal,
}: ConnectToGetStartedProps) => {
	return (
		<>
			{connectMsg && <div className="card-desc">{connectMsg}</div>}
			<BtnConnect btnMsg={btnMsg} openConnectModal={openConnectModal} />
		</>
	);
};

export const ConnectOr = ({
	btnMsg,
	connectMsg,
	openConnectModal,
	children,
}: ConnectOrProps) => {
	const currAcct = useCurrentAccount();
	if (currAcct) {
		return children;
	}
	return (
		<ConnectToGetStarted
			connectMsg={connectMsg}
			btnMsg={btnMsg}
			openConnectModal={openConnectModal}
		/>
	);
};
