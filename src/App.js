import logo from "./logo.svg"
import "./App.css"
import { navigate, register, Router } from "./lib/routes"
import { Link } from "@material-ui/core"

register(
    "/testme",
    <div>
        Testing<h1>This</h1>
    </div>
)

register("/test/:id/me", <TestRoute />)

function TestRoute({ id }) {
    return <div>Route {id}</div>
}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />

                <Link
                    component="button"
                    onClick={() =>
                        navigate(`https://2rip4.csb.app/test${Date.now()}`)
                    }
                >
                    Learn React
                </Link>

                <Router />
            </header>
        </div>
    )
}

export default App
