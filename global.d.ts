import * as manageModule from './src/logics/manage'; 

declare global {
    var _rib_manage: typeof manageModule;
}

export {};
