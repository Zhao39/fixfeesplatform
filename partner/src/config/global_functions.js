export const getStatusTextColor = (status, m) => {
    switch (status) {
        case -1:
            return m == "dark" ? 'black' : 'black';
        case 0:
            return m == "dark" ? 'black' : 'black';
        case 1:
            return m == "dark" ? 'black' : '#eeeeee';
        case 2:
            return m == "dark" ? '#eeeeee' : 'black';
        case 3:
            return m == "dark" ? '#eeeeee' : '#eeeeee';
        default:
            return m == "dark" ? 'black' : '#eeeeee';
    }
};
export const getPartnerStatusTextColor = (status, m) => {
    switch (status) {
        case 0:
            return m == "dark" ? '#eeeeee' : 'black';
        case 1:
            return m == "dark" ? '#eeeeee' : 'black';
        case 2:
            return m == "dark" ? 'black' : '#eeeeee';
        case 3:
            return m == "dark" ? 'black' : '#eeeeee';
        default:
            return m == "dark" ? 'black' : '#eeeeee';
    }
};