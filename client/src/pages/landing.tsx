import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Calculator, 
  Send, 
  Shield, 
  BarChart3, 
  Smartphone,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: TrendingUp,
      title: "Inventory Management",
      description: "Track uplink and downline inventory with automated calculations"
    },
    {
      icon: Calculator,
      title: "Automated Ledger",
      description: "Automatic balance calculations and profit/loss reports"
    },
    {
      icon: Send,
      title: "WhatsApp Integration",
      description: "Send settlement reports directly via WhatsApp"
    },
    {
      icon: BarChart3,
      title: "Custom Reports",
      description: "Generate detailed reports for any date range"
    },
    {
      icon: Shield,
      title: "Audit Trail",
      description: "Complete tracking of all system activities"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your system from any device, anywhere"
    }
  ];

  const benefits = [
    "Replace manual Excel tracking",
    "Automate weekly settlements",
    "Real-time balance visibility",
    "Secure role-based access",
    "Complete transaction history",
    "Professional reporting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5" data-testid="landing-page">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-primary" data-testid="brand-title">
              Bookie System
            </h1>
          </div>
          <Button 
            onClick={() => setLocation("/login")}
            data-testid="login-button"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="hero-title">
            Digitize Your Bookie Operations
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="hero-description">
            Replace manual Excel tracking with automated inventory management, 
            real-time calculations, and WhatsApp settlement integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setLocation("/login")}
              className="text-lg px-8 py-6"
              data-testid="get-started-button"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6"
              data-testid="learn-more-button"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16" data-testid="features-section">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" data-testid="features-title">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to manage your cricket ID and betting inventory operations efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow" data-testid={`feature-card-${index}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16" data-testid="benefits-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" data-testid="benefits-title">
                Why Choose Our System?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Transform your manual processes into an automated, professional operation 
                with real-time visibility and complete control.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3" data-testid={`benefit-${index}`}>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="bg-background shadow-lg" data-testid="demo-card">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Ready to Get Started?</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Join hundreds of bookies who have already digitized their operations.
                </p>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    ✓ Setup in minutes<br />
                    ✓ No technical knowledge required<br />
                    ✓ Full support included
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => setLocation("/login")}
                    data-testid="start-now-button"
                  >
                    Start Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary">Bookie System</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Bookie Inventory Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}