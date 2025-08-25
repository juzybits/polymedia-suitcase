import { useCurrentAccount } from "@mysten/dapp-kit";
import type { ReactNode } from "react";
import { Btn } from "./buttons";

export type BtnConnectProps = {
	btnMsg?: string | undefined;
	wrap?: boolean | undefined;
	openConnectModal: () => void;
};

export type ConnectToGetStartedProps = {
	connectMsg?: string | undefined;
} & BtnConnectProps;

export type ConnectOrProps = {
	children: ReactNode;
} & ConnectToGetStartedProps;

export const BtnConnect = ({ btnMsg, wrap, openConnectModal }: BtnConnectProps) => {
	return (
		<Btn onClick={() => Promise.resolve(openConnectModal())} wrap={wrap}>
			{btnMsg ?? "CONNECT"}
		</Btn>
	);
};

export const ConnectToGetStarted = ({
	btnMsg,
	wrap,
	connectMsg,
	openConnectModal,
}: ConnectToGetStartedProps) => {
	return (
		<>
			{connectMsg && <div className="card-desc">{connectMsg}</div>}
			<BtnConnect btnMsg={btnMsg} wrap={wrap} openConnectModal={openConnectModal} />
		</>
	);
};

export const ConnectOr = ({
	btnMsg,
	wrap,
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
			wrap={wrap}
			openConnectModal={openConnectModal}
		/>
	);
};
