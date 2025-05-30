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
                <p className="text-lg text-muted-foreground">
                    {"Sử dụng các chế độ hỗ trợ chuyên nghiệp để hỗ trợ bệnh nhân khiếm thị"}
                </p>
            );
        } else {
            return (
                <p className="text-lg text-muted-foreground">
                    {"Chọn chế độ hỗ trợ thị giác phù hợp với nhu cầu của bạn"}
                </p>
            );
        }
    } else if (page === "settings") {
        return (
            <p className="text-lg text-muted-foreground">
                {"Cấu hình các tùy chọn hỗ trợ và thiết bị của bạn"}
            </p>
        );
    } else if (page === "create") {
        return (
            <p className="text-lg text-muted-foreground">
                {"Tùy chỉnh các chế độ hỗ trợ thị giác theo nhu cầu cá nhân của bạn"}
            </p>
        );
    }

    // if they are a regular user
    // return <CreditsRemaining user={user} languageCode={languageCode} />;
};

export default HomePageSubtitles;
