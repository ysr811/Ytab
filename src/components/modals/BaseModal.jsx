import { Modal } from "@heroui/react";

/**
 * Reusable BaseModal component that encapsulates HeroUI Modal boilerplate:
 * Modal -> Backdrop -> Container -> Dialog -> CloseTrigger -> Header -> Body -> Footer.
 */
export function BaseModal({
  isOpen,
  onOpenChange,
  title,
  children,
  footer,
  placement = "center",
  backdropVariant,
  className = "max-w-sm",
  bodyClassName = "py-4",
  headerClassName,
  footerClassName = "flex justify-end gap-2 pt-2",
  stopPropagation = false,
}) {
  const handleStopPropagation = (e) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop variant={backdropVariant}>
        <Modal.Container placement={placement}>
          <Modal.Dialog
            className={className}
            onKeyDown={handleStopPropagation}
            onPointerDown={handleStopPropagation}
            onMouseDown={handleStopPropagation}
          >
            <Modal.CloseTrigger />

            {title && (
              <Modal.Header className={headerClassName}>
                <Modal.Heading className="flex items-center gap-2">
                  {title}
                </Modal.Heading>
              </Modal.Header>
            )}

            <Modal.Body className={bodyClassName}>
              {children}
            </Modal.Body>

            {footer && (
              <Modal.Footer className={footerClassName}>
                {footer}
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default BaseModal;
