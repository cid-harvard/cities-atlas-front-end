import styled from 'styled-components/macro';

interface Input {
  title: string;
  color: string;
  rows: string[][];
  boldColumns?: number[];
  additionalHTML?: string;
}

export const RapidTooltipRoot = styled.div`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  padding-bottom: 0.5rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  transition: opacity 0.15s ease;
  color: #333;
  background-color: #fff;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 1.5rem));
  display: none;
`;

export const getStandardTooltip = (input: Input) => {
  const columnCount = input.rows.length && input.rows[0].length ? input.rows[0].length : 1;

  let rows: string = '';
  input.rows.forEach(r => {
    let row = '';
    r.forEach((c, i) => {
      const alignment = i === 0
        ? 'justify-content: flex-start; text-align: left;'
        : 'justify-content: flex-end; text-align: right;';
      const style = input.boldColumns && input.boldColumns.includes(i)
        ? `style="font-weight: 600;${alignment}"` : '';
      row = row + `<div class="rapid-tooltip-cell" ${style}>${c}</div>`;
    });
    rows = rows + row;
  });

  const additionalContent = input.additionalHTML ? `<div>${input.additionalHTML}</div>` : '';

  return `
    <div>
      <div class="rapid-tooltip-title" style="background-color: ${input.color};">
        ${input.title}
      </div>
      <div
        class="rapid-tooltip-subsection-grid"
        style="display: grid; grid-template-columns: repeat(${columnCount}, auto);"
      >
        ${rows}
      </div>
      ${additionalContent}
    </div>
    <div class="rapid-tooltip-arrow-container">
      <div class="rapid-tooltip-arrow"></div>
    </div>
  `;
};