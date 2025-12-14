import React from 'react';
import LoginUi from "@/module/auth/components/login-ui";
import {requireUnAuth} from "@/module/auth/utils/auth-utils";


const LoginPage = async () => {

    await requireUnAuth();

    return (
        <LoginUi/>
    );
};

export default LoginPage;