import React from 'react';
import {ProfileForm} from "@/module/settings/compenents/profile-form";
import {RepositoryList} from "@/module/settings/compenents/repository-list";

const SettingPage = () => {
    return (
        <div className="space-x-6">
            <ProfileForm/>
            <RepositoryList/>
        </div>
    );
};

export default SettingPage;