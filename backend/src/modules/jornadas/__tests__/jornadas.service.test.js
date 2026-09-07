
jest.mock('../jornadas.repository');

const jornadasRepository = require('../jornadas.repository');
const jornadasService = require('../jornadas.service');
const NotFoundError = require('../../../errors/NotFoundError');
const ConflictError = require('../../../errors/ConflictError');

describe('jornadas.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerJornadaPorId', () => {
    it('devuelve la jornada cuando el repository la encuentra', async () => {
      const jornadaSimulada = { id: '1', nombre: 'Jornada de prueba' };
      jornadasRepository.buscarJornadaPorId.mockResolvedValue(jornadaSimulada);

      const resultado = await jornadasService.obtenerJornadaPorId('1');

      expect(resultado).toEqual(jornadaSimulada);
      expect(jornadasRepository.buscarJornadaPorId).toHaveBeenCalledWith('1');
    });

    it('lanza NotFoundError cuando el repository no encuentra la jornada', async () => {
      jornadasRepository.buscarJornadaPorId.mockResolvedValue(null);

      await expect(jornadasService.obtenerJornadaPorId('id-inexistente'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('modificarJornada', () => {
    it('lanza ConflictError si el nuevo cupoTotal es menor al cupo_ocupado actual', async () => {
      jornadasRepository.buscarJornadaPorId.mockResolvedValue({
        id: '1',
        cupo_total: 10,
        cupo_ocupado: 8,
      });

      await expect(
        jornadasService.modificarJornada('1', { cupoTotal: 5 }),
      ).rejects.toThrow(ConflictError);

      expect(jornadasRepository.actualizarJornada).not.toHaveBeenCalled();
    });

    it('permite reducir el cupo si el nuevo valor es mayor o igual al ocupado', async () => {
      jornadasRepository.buscarJornadaPorId.mockResolvedValue({
        id: '1',
        cupo_total: 10,
        cupo_ocupado: 5,
      });
      jornadasRepository.actualizarJornada.mockResolvedValue({
        id: '1',
        cupo_total: 6,
        cupo_ocupado: 5,
      });

      const resultado = await jornadasService.modificarJornada('1', { cupoTotal: 6 });

      expect(resultado.cupo_total).toBe(6);
      expect(jornadasRepository.actualizarJornada).toHaveBeenCalledWith('1', { cupoTotal: 6 });
    });

    it('lanza NotFoundError si la jornada a modificar no existe', async () => {
      jornadasRepository.buscarJornadaPorId.mockResolvedValue(null);

      await expect(
        jornadasService.modificarJornada('id-inexistente', { cupoTotal: 5 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('eliminarJornada', () => {
    it('lanza NotFoundError si no hay ninguna jornada para desactivar', async () => {
      jornadasRepository.desactivarJornada.mockResolvedValue(null);

      await expect(jornadasService.eliminarJornada('id-inexistente'))
        .rejects.toThrow(NotFoundError);
    });

    it('devuelve la jornada desactivada cuando existe', async () => {
      const jornadaDesactivada = { id: '1', activa: false };
      jornadasRepository.desactivarJornada.mockResolvedValue(jornadaDesactivada);

      const resultado = await jornadasService.eliminarJornada('1');

      expect(resultado).toEqual(jornadaDesactivada);
    });
  });
});