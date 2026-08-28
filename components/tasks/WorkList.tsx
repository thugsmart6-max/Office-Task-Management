export function WorkMarquee({
  words = ["Your desk. Your work. Start now and finish it today."],
}: {
  words?: string[];
}) {
  const run = Array.from({ length: 6 }, () => words).flat().join("   ");
  return (
    <div className="ws-marquee my-6 sm:my-10 md:my-12">
      <div className="ws-marquee-track">
        <span>{run}&nbsp;</span>
        <span>{run}&nbsp;</span>
      </div>
    </div>
  );
}
