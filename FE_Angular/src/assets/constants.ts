import { faCheck, faArrowRightToBracket, faArrowRightFromBracket, faMinusCircle, faOutdent, faPlusCircle, faRefresh, faXmark, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

export const constants = {
    zIndexLevel: {
        mainPage: 0, 
        navBar: 100000,
        popupOffcanvas: 200000, 
        alertsSpinners: 300000
    }, 
    icons: {
        check: faCheck, 
        mark: faXmark, 
        plusCircle: faPlusCircle, 
        minusCircle: faMinusCircle, 
        refresh: faRefresh, 
        inbox: faArrowRightToBracket,
        outbox: faArrowRightFromBracket, 
        confirmed: faCheckDouble
    }, 
    colors: {
        lightRed: '#FF9999', 
        darkerLightRed: '#B22222', 
        red: '#FF0000', 
        darkerRed: '#800000', 
        lightGreen: '#90EE90', 
        darkerLightGreen: '#228B22', 
        green: '#008000', 
        darkerGreen: '#006400', 
        gray: '#808080', 
        darkerGray: '#696969', 
        gold: '#FFD700', 
        darkerGold: '#DAA520'
    }, 
    status: {
        success: 'SUCCESS', 
        fail: 'FAIL', 
        warning: 'WARNING'
    }
}