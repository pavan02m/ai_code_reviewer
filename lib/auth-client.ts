import {createAuthClient} from "better-auth/react";
import {polarClient} from "@polar-sh/better-auth";

export const {signIn, signOut, useSession, signUp, customer, checkout} = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL!,
    plugins:[
        polarClient()
    ]
});