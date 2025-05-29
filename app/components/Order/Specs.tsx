import { Check } from "lucide-react";

const includedItems = [
    "Thiết bị Aisha AI",
    "Cáp sạc USB Type-C",
    // "Quick Start Guide",
    "1 Tháng trải nghiệm dùng thử miễn phí",
    "2 Dây silicon",
];

const technicalSpecs = [
    "Kích thước: 4.5cm x 3.8cm x 1.9cm",
    "Thời gian sử dụng pin: 4+ ngày chờ, 6 giờ sử dụng",
    "Kết nối: Bluetooth 2.4 GHz, Wi-Fi + Hotspot",
    "Truy cập bất kỳ nhân vật AI nào từ Aisha",
    "Tạo nhân vật AI của bạn với bất kỳ giọng nói và tính cách riêng biệt nào",
];

const Specs = () => {
    const CheckIcon = <Check className="h-5 w-5 text-primary flex-shrink-0" />;
    return (
        <div className="mb-16">
            <h2 className="text-4xl font-semibold mb-8 text-center">
                Product Details
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        What&apos;s Included:
                    </h3>
                    <ul className="space-y-2">
                        {includedItems.map((item, index) => (
                            <li className="flex items-center gap-2" key={index}>
                                {CheckIcon}
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Technical Specs:
                    </h3>
                    <ul className="space-y-2">
                        {technicalSpecs.map((spec, index) => (
                            <li className="flex items-center gap-2" key={index}>
                                {CheckIcon}
                                <span>{spec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Specs;
