import { generateSecret } from '@authentication/google-authenticator';
import { getQRCodeURI } from '@authentication/google-authenticator';
import { verifyToken } from '@authentication/google-authenticator';

export default class TwoFactAuth {
    constructor() {

    }

    /**
     * generate a secret code for 2FA
     */
    public getGaSecret = async () => {
        const gaSecret = await generateSecret()
        return gaSecret
    }

    /**
     * generate QR code for 2FA
     */
    public getGaQRCode = async (gaSecret: string, lebel: string, issuer: string = "") => {
        // const svg = await getQRCodeSVG({
        //     secret: gaSecret,
        //     label: lebel,
        //     issuer: issuer
        // });
        // const uri = getQRCodeURI({
        //     secret: user.gaSecret,
        //     label: 'MyApp:user@example.com',
        //     issuer: 'MyApp'
        // });

        const uri = getQRCodeURI({
            secret: gaSecret,
            label: lebel,
            issuer: issuer
        });
        return uri
    }

    /**
     * Verify token for 2FA
     */
    public verifyCode = async (token: string, gaSecret: string) => {
        if (verifyToken({ secret: gaSecret, token: token, window: 2 }) === true) {
            // verified token
            return true
        } else {
            return false
        }
    }
}

export const twoFactAuth = new TwoFactAuth()