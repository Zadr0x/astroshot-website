import AnimatedCounter from "@/components/AnimatedCounter";

const stats = [
  { target: 500, suffix: "M+", label: "Organic Views" },
  { target: 170, suffix: "+", label: "Happy Clients" },
  { target: 8, suffix: "+", label: "Years of Excellence" },
];

export default function StatsSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-0 lg:divide-x lg:divide-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="lg:px-12 first:pl-0 last:pr-0">
              <AnimatedCounter
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
