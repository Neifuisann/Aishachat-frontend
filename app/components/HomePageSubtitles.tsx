interface HomePageSubtitlesProps {
    user: IUser;
    page: "home" | "settings" | "create";
    languageCode?: string;
}

const HomePageSubtitles: React.FC<HomePageSubtitlesProps> = ({
    user,
    page,
    languageCode = "vi-VN",
}) => {
    if (page === "home") {
        if (user.user_info.user_type === "doctor") {
            return (
                <p className="text-sm text-gray-600">
                    {"Sử dụng các nhân vật hoặc thiết bị của bạn để tương tác với bệnh nhân"}
                </p>
            );
        } else {
            return (
                <p className="text-sm text-gray-600">
                    {"Nói chuyện với bất kỳ nhân vật AI nào dưới đây"}
                </p>
            );
        }
    } else if (page === "settings") {
        return (
            <p className="text-sm text-gray-600">
                {"Bạn có thể cập nhật các cài đặt của bạn dưới đây"}
            </p>
        );
    } else if (page === "create") {
        return (
            <p className="text-sm text-gray-600">
                {"Tùy chỉnh giọng nói, ngôn ngữ, phong cách và nhiều hơn nữa của nhân vật của bạn"}
            </p>
        );
    }

    // if they are a regular user
    // return <CreditsRemaining user={user} languageCode={languageCode} />;
};

export default HomePageSubtitles;
