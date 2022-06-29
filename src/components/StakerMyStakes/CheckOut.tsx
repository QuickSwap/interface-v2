import { Trans } from "@lingui/macro";
import { CheckOutLink } from "./styled";

export function CheckOut({ link }: { link: string }) {
    return (
        <CheckOutLink to={`/farming/${link}`}>
            <span>
                <Trans>✨ New farm is available →</Trans>
            </span>
        </CheckOutLink>
    );
}
