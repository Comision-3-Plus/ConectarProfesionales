'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PortfolioItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioGalleryProps {
  items: PortfolioItem[];
}

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    index: number;
    totalInItem: number;
  } | null>(null);

  const allImages = items.flatMap((item) =>
    item.imagenes
      .sort((a, b) => a.orden - b.orden)
      .map((img) => ({
        url: img.imagen_url,
        itemTitle: item.titulo,
        itemDescription: item.descripcion,
      }))
  );

  const handleNext = () => {
    if (selectedImage && selectedImage.index < allImages.length - 1) {
      setSelectedImage({
        ...selectedImage,
        index: selectedImage.index + 1,
        url: allImages[selectedImage.index + 1].url,
      });
    }
  };

  const handlePrev = () => {
    if (selectedImage && selectedImage.index > 0) {
      setSelectedImage({
        ...selectedImage,
        index: selectedImage.index - 1,
        url: allImages[selectedImage.index - 1].url,
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-500">No hay proyectos en el portfolio aún.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group space-y-3"
          >
            {/* Image Grid */}
            {item.imagenes.length > 0 && (
              <div
                className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border border-slate-200"
                onClick={() =>
                  setSelectedImage({
                    url: item.imagenes[0].imagen_url,
                    index: allImages.findIndex((img) => img.url === item.imagenes[0].imagen_url),
                    totalInItem: item.imagenes.length,
                  })
                }
              >
                <Image
                  src={item.imagenes[0].imagen_url}
                  alt={item.titulo}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.imagenes.length > 1 && (
                  <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                    +{item.imagenes.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* Title and Description */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">{item.titulo}</h4>
              {item.descripcion && (
                <p className="line-clamp-2 text-sm text-slate-600">{item.descripcion}</p>
              )}
              {item.fecha_proyecto && (
                <p className="text-xs text-slate-500">
                  {new Date(item.fecha_proyecto).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative">
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.div
                  key={selectedImage.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-[4/3] w-full"
                >
                  <Image
                    src={selectedImage.url}
                    alt="Portfolio image"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {selectedImage && selectedImage.index > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {selectedImage && selectedImage.index < allImages.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Counter */}
            {selectedImage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
                {selectedImage.index + 1} / {allImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
