export type EnglishCopy =
    | "Playground"
    | "Trends"
    | "Settings"
    | "Play"
    | "Characters"
    | "Sent"
    | "Chat"
    | "Send to device"
    | "Upgrade"
    | "No characters found"
    | "Doctor's AI Assistants"
    | "credits remaining"
    | "Get unlimited access"
    | "Upgrade to continue"
    | "You can update your settings below"
    | "Track your patients' progress and trends here"
    | "Use this các nhân vật or your device to engage your patients"
    | "For children"
    | "For doctors";

const tx = (languageCode: "en-US"|"vi-VN") => {
    return (key: EnglishCopy) => {
        if (!languageCode) {
            languageCode = "vi-VN";
        }
        if (!key) {
            key = "Playground";
        }
        return {
            "en-US": {
                Playground: "Playground",
                Upgrade: "Upgrade",
                Trends: "Trends",
                Settings: "Settings",
                Play: "Play",
                Characters: "Characters",
                Sent: "Sent",
                Chat: "Chat",
                "Send to device": "Send to device",
                "No characters found": "No characters found",
                "Doctor's AI Assistants": "Doctor's AI Assistants",
                "credits remaining": "credits remaining",
                "Get unlimited access": "Get unlimited access",
                "Upgrade to continue": "Upgrade to continue",
                "You can update your settings below":
                    "You can update your settings here",
                "Track your patients' progress and trends here":
                    "Track your patients' progress and trends here",
                "Use this các nhân vật or your device to engage your patients":
                    "Use this các nhân vật or your device to engage your patients",
                "For children": "For children",
                "For doctors": "For doctors",
            },
            "vi-VN": {
                Playground: "Trang chơi",
                Upgrade: "Nâng cấp",
                Trends: "Trends",
                Settings: "Cài đặt",
                Play: "Chơi",
                Characters: "Nhân vật",
                Sent: "Gửi",
                Chat: "Chat",
                "Send to device": "Gửi đến thiết bị",
                "No characters found": "Không tìm thấy nhân vật",
                "Doctor's AI Assistants": "Trợ lý AI của bác sĩ",
                "credits remaining": "tín dụng còn lại",
                "Get unlimited access": "Nhận truy cập vô hạn",
                "Upgrade to continue": "Nâng cấp để tiếp tục",
                "You can update your settings below":
                    "Bạn có thể cập nhật cài đặt của mình dưới đây",
                "Track your patients' progress and trends here":
                    "Theo dõi tiến trình và xu hướng của bệnh nhân của bạn ở đây",
                "Use this các nhân vật or your device to engage your patients":
                    "Sử dụng các nhân vật này hoặc thiết bị của bạn để tương tác với bệnh nhân của bạn",
                "For children": "Dành cho trẻ em",
                "For doctors": "Dành cho bác sĩ",
            },
        }[languageCode][key];
    };
};
