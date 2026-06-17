import fs from "fs"
import path from "path"
import morgan from "morgan"

const __dirname = path.resolve()

export const attachRouterWithLogger =  (app,routerPath , router , logFileName) => {

    const logStream = fs.createWriteStream(
        path.join(__dirname, "./src/logger" , logFileName),
        {
            flags:"a" // a this flag append
        })

    app.use(routerPath , morgan("combined" , {stream:logStream}) , router)

    app.use(routerPath , morgan("dev") , router)
}