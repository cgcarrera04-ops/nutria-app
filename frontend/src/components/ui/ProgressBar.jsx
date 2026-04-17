import T from "../../tokens/T";

const ProgressBar = ({ step, total, completedSteps = [], onStepClick }) => (
  <div style={{ padding: "20px 24px 0", display: "flex", gap: 6, alignItems: "center" }}>
    {[...Array(total)].map((_, i) => {
      const stepNum     = i + 1;
      const isCurrent   = stepNum === step;
      const isCompleted = completedSteps.includes(stepNum);
      const isClickable = isCompleted && onStepClick;
      return (
        <div
          key={i}
          onClick={() => isClickable && onStepClick(stepNum)}
          title={isClickable ? `Volver al paso ${stepNum}` : undefined}
          style={{
            height:       isCurrent ? 5 : 3,
            flex:         1,
            borderRadius: 3,
            background:   isCompleted || isCurrent ? T.teal : T.border,
            transition:   "all .35s cubic-bezier(.22,.68,0,1.15)",
            cursor:       isClickable ? "pointer" : "default",
            opacity:      isCompleted ? 1 : isCurrent ? 1 : 0.5,
          }}
          onMouseEnter={e => { if (isClickable) e.target.style.background = T.tealDark; }}
          onMouseLeave={e => { if (isClickable) e.target.style.background = T.teal; }}
        />
      );
    })}
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
      color: T.textMuted, marginLeft: 8, flexShrink: 0,
    }}>
      {step}/{total}
    </span>
  </div>
);

export default ProgressBar;
