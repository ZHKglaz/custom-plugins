/*
 * Vencord, a Discord client mod
 * Plugin: ShowID
 *
 * Displays the target user's snowflake ID in the User Profile modal,
 * directly below the "Member Since" section.
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Forms } from "@webpack/common";

interface MemberSinceProps {
    user?: { id: string; };
    userId?: string;
}

function UserIdSection({ userId }: { userId: string; }) {
    if (!userId) return null;

    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">User ID</Forms.FormTitle>
            <div
                className="vc-show-id-value"
                style={{ userSelect: "text", fontFamily: "var(--font-code, monospace)" }}
            >
                {userId}
            </div>
        </Forms.FormSection>
    );
}

export default definePlugin({
    name: "ShowID",
    description: "Shows the user's snowflake ID in their profile modal, below Member Since",
    authors: [Devs.Ven],

    patches: [
        {
            // Targets the "Member Since" block rendered inside the profile
            // panel body. It receives the profile's `user` (or `userId`)
            // as a prop, which we reuse to render our own section right
            // after it.
            find: "\"Member Since\"",
            replacement: {
                match: /(return \i\.createElement\(\i\.Fragment,null,)(\i\.createElement\(\i,\{[^}]*?MEMBER_SINCE[^}]*?\}\))(\))/,
                replace: "$1$2,$self.renderUserId(this.props)$3"
            }
        }
    ],

    renderUserId(props: MemberSinceProps) {
        const userId = props?.user?.id ?? props?.userId;
        if (!userId) return null;

        return <UserIdSection userId={userId} />;
    }
});
