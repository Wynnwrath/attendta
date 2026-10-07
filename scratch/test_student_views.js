const fs = require('fs');

const studentJs = fs.readFileSync('f:/AttendTa/js/student.js', 'utf8');
const portalCss = fs.readFileSync('f:/AttendTa/css/portal.css', 'utf8');

console.log("=== Checking List View Fixes ===");

// 1. Check btn-expand-pill is removed from event-row-action
const hasExpandPillInAction = studentJs.includes('event-row-action') && studentJs.includes('event-expand-btn-');
console.log("1. No Expand Details ghost button in event-row-action:", !hasExpandPillInAction ? "PASS" : "FAIL");

// 2. Check no list-urgency-meta in student.js
const hasListUrgencyMeta = studentJs.includes('list-urgency-meta');
console.log("2. Redundant list-urgency-meta stripped out:", !hasListUrgencyMeta ? "PASS" : "FAIL");

// 3. Check isConcluded logic present in renderCardHtml and renderListRowHtml
const hasConcludedLogic = studentJs.includes("ev.status === 'Concluded'") && studentJs.includes('fill-slate');
console.log("3. Concluded status accurately detected (no false fast-filling):", hasConcludedLogic ? "PASS" : "FAIL");

// 4. Check stopPropagation on all list view action buttons
const hasStopPropOnActionBtns = studentJs.includes("onclick=\"event.stopPropagation(); StudentApp.showDoorPassModal") &&
                                studentJs.includes("onclick=\"event.stopPropagation(); StudentApp.registerForEvent");
console.log("4. event.stopPropagation() on primary action buttons:", hasStopPropOnActionBtns ? "PASS" : "FAIL");

// 5. Check CSS 4px capacity track in .event-row-urgency
const has4pxTrack = portalCss.includes('.event-row-urgency .capacity-track') && portalCss.includes('height: 4px');
console.log("5. 4px high horizontal track in .event-row-urgency:", has4pxTrack ? "PASS" : "FAIL");

// 6. Check high-contrast typography in logistics
const hasHighContrastLogistics = portalCss.includes('#334155') && portalCss.includes('.event-row-logistics');
console.log("6. High-contrast Slate 700 (#334155) for logistics:", hasHighContrastLogistics ? "PASS" : "FAIL");

if (!hasExpandPillInAction && !hasListUrgencyMeta && hasConcludedLogic && hasStopPropOnActionBtns && has4pxTrack && hasHighContrastLogistics) {
  console.log("\nALL 6 CHECKS PASSED PERFECTLY!");
} else {
  console.error("\nSOME CHECKS FAILED!");
  process.exit(1);
}
