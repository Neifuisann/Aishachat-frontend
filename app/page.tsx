import Link from "next/link"
import { Eye, Users, Shield, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image";

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6 max-w-screen-lg mx-auto">
            <div className="grid gap-8 lg:grid-cols-1 lg:gap-12 items-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <h1 className="text-4xl text-center md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground" style={{ lineHeight: '1.2' }}>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                    Nền tảng hỗ trợ thị giác AI
                  </span>{" "}
                  <span className="text-foreground">thời gian thực</span>
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-[700px] leading-relaxed">
                  <span className="font-silkscreen mx-1 text-primary font-bold">Aisha</span> cung cấp các công cụ hỗ trợ thị giác AI chuyên nghiệp cho người khiếm thị và những người cần hỗ trợ thị giác.
                </p>

                <div className="flex flex-col gap-6 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/home">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto flex-row items-center gap-3 text-lg h-16 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      >
                        <span>Bắt đầu hỗ trợ</span>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-2 justify-center text-accent mb-4">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground font-medium">Với các đánh giá tích cực từ người dùng</span>
                  </div>
                  {/* <div className="flex items-center space-x-3">
                      <Link href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 transition-colors">
                          <FaDiscord size={24} />
                      </Link>
                      <Link href="https://tiktok.com/@Aishaai" target="_blank" rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 transition-colors">
                        <FaTiktok size={24} />
                      </Link>
                    </div> */}

                </div>

                <div className="flex flex-row gap-2 items-center">
                  <div className="w-full py-12">
                    <h3 className="text-center text-sm font-medium text-muted-foreground mb-8">CÔNG NGHỆ ĐÁNG TIN CẬY</h3>
                    <div className="flex flex-wrap justify-center items-center gap-12">
                      <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="transition-all opacity-70 hover:opacity-100">
                        <Image src="/logos/vercel.png" alt="Vercel - Nền tảng triển khai" width={100} height={24} style={{ height: '36px', width: 'auto' }} />
                      </a>
                      <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="transition-all opacity-70 hover:opacity-100">
                        <Image src="/logos/supabase.png" alt="Supabase - Cơ sở dữ liệu bảo mật" width={100} height={24} style={{ height: '48px', width: 'auto' }} />
                      </a>
                      <a href="https://arduino.cc" target="_blank" rel="noopener noreferrer" className="transition-all opacity-70 hover:opacity-100">
                        <Image src="/logos/arduino.png" alt="Arduino - Phần cứng mở" width={100} height={24} style={{ height: '36px', width: 'auto' }} />
                      </a>
                      <a href="https://espressif.com" target="_blank" rel="noopener noreferrer" className="transition-all opacity-70 hover:opacity-100">
                        <Image src="/logos/espressif.png" alt="Espressif ESP32 - Vi xử lý" width={100} height={24} style={{ height: '24px', width: 'auto' }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        {/* <ProductsSection /> */}

                {/* How It Works */}
                <section className="w-full py-16 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Dễ dàng tiếp cận và sử dụng
              </h2>
              <p className="text-lg text-muted-foreground mt-2">3 bước đơn giản để bắt đầu hỗ trợ thị giác</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-8 shadow-lg border border-border transform transition-transform hover:scale-105">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Kết nối thiết bị</h3>
                <p className="text-muted-foreground leading-relaxed">Khởi động và kết nối thiết bị Aisha với mạng internet</p>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-lg border border-border transform transition-transform hover:scale-105">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Cấu hình hỗ trợ</h3>
                <p className="text-muted-foreground leading-relaxed">Sử dụng <a href="/home" className="text-primary font-medium hover:underline">nền tảng web</a> để thiết lập các chế độ hỗ trợ phù hợp</p>
              </div>

              <div className="bg-card rounded-xl p-8 shadow-lg border border-border transform transition-transform hover:scale-105">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Nhận hỗ trợ</h3>
                <p className="text-muted-foreground leading-relaxed">Bắt đầu sử dụng các tính năng hỗ trợ thị giác AI - an toàn và hiệu quả!</p>
              </div>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section className="w-full py-16 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Tính năng hỗ trợ thị giác toàn diện
              </h2>
              <p className="text-lg text-muted-foreground mt-2">Các công cụ AI chuyên nghiệp được thiết kế cho người khiếm thị</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Nhận dạng đối tượng</h3>
                <p className="text-muted-foreground">AI mô tả chi tiết các đối tượng, người và môi trường xung quanh bạn</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Hỗ trợ điều hướng</h3>
                <p className="text-muted-foreground">Hướng dẫn di chuyển an toàn và hiệu quả trong không gian</p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Bảo mật và riêng tư</h3>
                <p className="text-muted-foreground">Dữ liệu được bảo vệ với tiêu chuẩn bảo mật cao nhất</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        {/*
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Your <span className="font-silkscreen">Aisha</span> Today!</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                  <div className="text-5xl md:text-6xl font-bold">${DEVICE_COST}</div>
                  <div className="text-xl">
                    <span className="block">One-time purchase</span>
                    <span className="block text-purple-100">+ ${SUBSCRIPTION_COST}/month after first FREE month<br /> <span className="text-xs">(or use your own OpenAI API key)</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left max-w-2xl mx-auto">
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Works with ANY toy or plushie</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Create unlimited AI characters</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>First month subscription FREE</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="bg-white rounded-full p-1 mt-1">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <span>Easy to set up in minutes</span>
                  </div>
                </div>

                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 text-lg h-14 px-8">
                  <Link href={"/products"}>Buy Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        */}

        {/* FAQ */}
        {/* <section className="w-full py-16 bg-purple-50">
        <FAQ className="bg-purple-50" titleClassName="text-purple-900" />
        </section> */}


        {/* CTA */}
        {/*
        <section className="w-full py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Bring Your Toys to Life?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Order your Aisha device today and watch the magic happen!
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 text-lg h-14 px-8">
              <Link href={"/products"}>Get Aisha for ${DEVICE_COST}</Link>
            </Button>
            <p className="mt-4 text-purple-100">First month subscription FREE, then just ${SUBSCRIPTION_COST}/month <span className="text-xs">(or use your own OpenAI API key)</span></p>
          </div>
        </section>
        */}
      </main>
    </div>
  )
}

