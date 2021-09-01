import { SignInScreen } from "../routes/parts/signin"
import { User } from "./useUser"

export function systemUser(Component) {
    return (props) => (
        <User shouldBeCreator={true} fallback={<SignInScreen />}>
            <Component {...props} />
        </User>
    )
}
