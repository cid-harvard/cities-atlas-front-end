import React, { useState } from "react";
import Tooltip, { TooltipPosition } from "../../../general/Tooltip";
import raw from "raw.macro";
import { useWindowWidth } from "../../../../contextProviders/appContext";
import {
  UtilityBarButtonBase,
  columnsToRowsBreakpoint,
  mediumSmallBreakpoint,
  Text,
  TooltipContent,
  SvgBase,
} from "../../Utils";
import useFluent from "../../../../hooks/useFluent";
import ShareModal from "./ShareModal";

const shareIconSvg = raw("../../../../assets/icons/share.svg");

const Share = () => {
  const windowDimensions = useWindowWidth();
  const getString = useFluent();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const modal = modalOpen ? <ShareModal onClose={closeModal} /> : null;
  return (
    <>
      <Tooltip
        explanation={
          windowDimensions.width < mediumSmallBreakpoint &&
          windowDimensions.width > columnsToRowsBreakpoint ? (
            <TooltipContent>{getString("global-ui-share")}</TooltipContent>
          ) : null
        }
        cursor="pointer"
        tooltipPosition={TooltipPosition.Bottom}
      >
        <UtilityBarButtonBase onClick={openModal}>
          <SvgBase dangerouslySetInnerHTML={{ __html: shareIconSvg }} />
          <Text>{getString("global-ui-share")}</Text>
        </UtilityBarButtonBase>
      </Tooltip>
      {modal}
    </>
  );
};

export default Share;
